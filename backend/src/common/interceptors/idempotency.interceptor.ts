import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { createHash } from 'crypto';

interface IdempotencyRecord {
  status: 'IN_PROGRESS' | 'COMPLETED';
  response?: any;
  timestamp: number;
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private static readonly TTL_MS = 30000; // 30 segundos de ventana para deduplicación
  private static readonly store = new Map<string, IdempotencyRecord>();

  constructor() {
    // Limpieza periódica de registros expirados en el almacenamiento en memoria
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of IdempotencyInterceptor.store.entries()) {
        if (now - record.timestamp > IdempotencyInterceptor.TTL_MS) {
          IdempotencyInterceptor.store.delete(key);
        }
      }
    }, 30000).unref();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const res = httpContext.getResponse();

    if (!req || !req.method) {
      return next.handle();
    }

    const method = req.method.toUpperCase();
    // Métodos seguros (lectura) no requieren idempotencia
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next.handle();
    }

    const explicitKey =
      req.headers['x-idempotency-key'] || req.headers['idempotency-key'];

    let idempotencyKey: string;
    if (explicitKey) {
      idempotencyKey = String(explicitKey);
    } else {
      // Si el cliente no pasa encabezado explícito, generamos un fingerprint determinista
      // basado en Método + URL + Usuario (o IP) + Cuerpo
      const userId = req.user?.id || req.ip || 'anon';
      const bodyString = req.body ? JSON.stringify(req.body) : '';
      const rawString = `${method}:${req.originalUrl || req.url}:${userId}:${bodyString}`;
      idempotencyKey = createHash('sha256').update(rawString).digest('hex');
    }

    const now = Date.now();
    const existing = IdempotencyInterceptor.store.get(idempotencyKey);

    if (existing) {
      const isExpired = now - existing.timestamp > IdempotencyInterceptor.TTL_MS;

      if (!isExpired) {
        if (existing.status === 'IN_PROGRESS') {
          // Si otra solicitud idéntica está ejecutándose en este exacto momento
          throw new ConflictException(
            'Solicitud duplicada en progreso. Por favor, espere un momento.',
          );
        }

        if (existing.status === 'COMPLETED') {
          // Si ya se completó recientemente, devolvemos la respuesta guardada
          if (res && typeof res.setHeader === 'function') {
            res.setHeader('x-idempotent-replayed', 'true');
          }
          return of(existing.response);
        }
      } else {
        IdempotencyInterceptor.store.delete(idempotencyKey);
      }
    }

    // Registrar solicitud en progreso de manera atómica
    IdempotencyInterceptor.store.set(idempotencyKey, {
      status: 'IN_PROGRESS',
      timestamp: now,
    });

    return next.handle().pipe(
      tap((response) => {
        IdempotencyInterceptor.store.set(idempotencyKey, {
          status: 'COMPLETED',
          response,
          timestamp: Date.now(),
        });
      }),
      catchError((err) => {
        // En caso de error en la ejecución, liberamos la clave para permitir un reintento
        IdempotencyInterceptor.store.delete(idempotencyKey);
        return throwError(() => err);
      }),
    );
  }
}
