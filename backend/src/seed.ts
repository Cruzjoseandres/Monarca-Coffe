import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Script de Seed: Crea los datos iniciales de la cafetería
 * - Estados base (ACTIVO, INACTIVO, DISPONIBLE, OCUPADA, RESERVADA)
 * - Roles (ADMINISTRADOR, MESERO)
 * - Persona + Usuario administrador
 *
 * Ejecutar con: yarn seed
 */

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cafeteria',
    synchronize: false,
    ssl: {
        rejectUnauthorized: false
    }
});

async function seed() {
    console.log('🌱 Conectando a la base de datos...');
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        console.log('🌱 Creando datos iniciales...\n');

        // 1. Crear Estados
        console.log('📋 Creando estados...');
        const estados = [
            { nombre: 'ACTIVO', ambito: 'GENERAL', descripcion: 'Registro activo' },
            { nombre: 'INACTIVO', ambito: 'GENERAL', descripcion: 'Registro inactivo' },
            { nombre: 'DISPONIBLE', ambito: 'MESA', descripcion: 'Mesa disponible' },
            { nombre: 'OCUPADA', ambito: 'MESA', descripcion: 'Mesa ocupada' },
            { nombre: 'RESERVADA', ambito: 'MESA', descripcion: 'Mesa reservada' },
        ];

        for (const estado of estados) {
            const exists = await queryRunner.query(
                `SELECT id FROM estado WHERE nombre = $1 AND ambito = $2`,
                [estado.nombre, estado.ambito]
            );
            if (exists.length === 0) {
                await queryRunner.query(
                    `INSERT INTO estado (nombre, ambito, descripcion, "D_E_L_E_T_E_D") VALUES ($1, $2, $3, false)`,
                    [estado.nombre, estado.ambito, estado.descripcion]
                );
                console.log(`   ✅ Estado "${estado.nombre}" (${estado.ambito}) creado`);
            } else {
                console.log(`   ⏭️  Estado "${estado.nombre}" (${estado.ambito}) ya existe`);
            }
        }

        // Obtener ID de estado ACTIVO
        const [estadoActivo] = await queryRunner.query(
            `SELECT id FROM estado WHERE nombre = 'ACTIVO' AND ambito = 'GENERAL'`
        );

        // 2. Crear Roles
        console.log('\n👥 Creando roles...');
        const roles = ['ADMINISTRADOR', 'MESERO'];
        for (const rolNombre of roles) {
            const exists = await queryRunner.query(
                `SELECT id FROM rol WHERE nombre = $1`,
                [rolNombre]
            );
            if (exists.length === 0) {
                await queryRunner.query(
                    `INSERT INTO rol (nombre, id_estado, "D_E_L_E_T_E_D") VALUES ($1, $2, false)`,
                    [rolNombre, estadoActivo.id]
                );
                console.log(`   ✅ Rol "${rolNombre}" creado`);
            } else {
                console.log(`   ⏭️  Rol "${rolNombre}" ya existe`);
            }
        }

        // Obtener ID del rol ADMINISTRADOR
        const [rolAdmin] = await queryRunner.query(
            `SELECT id FROM rol WHERE nombre = 'ADMINISTRADOR'`
        );

        // 3. Crear usuario Administrador
        console.log('\n🔑 Creando usuario administrador...');
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        const existsAdmin = await queryRunner.query(
            `SELECT id FROM usuario WHERE username = $1`,
            [adminUsername]
        );

        if (existsAdmin.length === 0) {
            // Crear persona
            const [persona] = await queryRunner.query(
                `INSERT INTO persona (nombre, apellido, telefono, email, "D_E_L_E_T_E_D")
                 VALUES ($1, $2, $3, $4, false) RETURNING id`,
                ['Admin', 'Sistema', '0000000000', 'admin@cafeteria.com']
            );

            // Hash password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            // Crear usuario
            await queryRunner.query(
                `INSERT INTO usuario (username, password, id_persona, id_rol, id_estado, "D_E_L_E_T_E_D")
                 VALUES ($1, $2, $3, $4, $5, false)`,
                [adminUsername, hashedPassword, persona.id, rolAdmin.id, estadoActivo.id]
            );

            console.log(`   ✅ Usuario administrador creado`);
            console.log(`\n   ┌─────────────────────────────┐`);
            console.log(`   │  👤 Usuario: ${adminUsername}            │`);
            console.log(`   │  🔒 Contraseña: ${adminPassword}       │`);
            console.log(`   │  🏷️  Rol: ADMINISTRADOR        │`);
            console.log(`   └─────────────────────────────┘`);
        } else {
            console.log(`   ⏭️  Usuario "${adminUsername}" ya existe`);
        }

        console.log('\n✨ Seed completado exitosamente!\n');

    } catch (error) {
        console.error('❌ Error durante el seed:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
