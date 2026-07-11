import { Usuario } from "src/usuario/entities/usuario.entity";
import { Estado } from "src/estado/entities/estado.entity";
import { DetallePedido } from "src/detalle-pedido/entities/detalle-pedido.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    nombre_cliente: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total: number;

    @Column({ nullable: true })
    tipo_pago: string; // 'Efectivo', 'QR', 'Mixto', 'Pendiente'

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_pagado: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_cambio: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_efectivo: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_qr: number;

    @Column({ nullable: true })
    comprobante_qr: string;

    @Column()
    fecha_apertura: Date;

    @Column({ nullable: true })
    fecha_cierre: Date;

    @ManyToOne(() => Estado)
    @JoinColumn({ name: 'id_estado' })
    estado: Estado;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @Column({ default: false })
    D_E_L_E_T_E_D: boolean;

    @Column({ nullable: true, length: 500 })
    justificativo_eliminacion: string;

    @ManyToOne(() => Usuario, (usuario) => usuario.pedidos)
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, { cascade: true })
    detalles: DetallePedido[];
}

