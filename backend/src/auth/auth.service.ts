import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usuarioService: UsuarioService,
        private jwtService: JwtService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usuarioService.findByUsername(username);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        // Injectamos el rol para que el Frontend lo pueda leer sin necesidad de pedirlo.
        const payload = {
            username: user.username,
            sub: user.id,
            rol: user.rol?.nombre // Guardamos el rol en el token Payload
        };

        return {
            access_token: this.jwtService.sign(payload),
            usuario: {
                id: user.id,
                username: user.username,
                rol: user.rol?.nombre,
                persona: user.persona
            }
        };
    }
}
