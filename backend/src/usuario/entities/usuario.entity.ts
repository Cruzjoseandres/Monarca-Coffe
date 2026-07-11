import { Pedido } from "src/pedido/entities/pedido.entity";
import { Persona } from "src/persona/entities/persona.entity";
import { Rol } from "src/rol/entities/rol.entity";
import { Estado } from "src/estado/entities/estado.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @OneToOne(() => Persona, (persona) => persona.usuario)
    @JoinColumn({ name: 'id_persona' })
    persona: Persona;

    @ManyToOne(() => Rol, (rol) => rol.usuarios)
    @JoinColumn({ name: 'id_rol' })
    rol: Rol;

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

    @OneToMany(() => Pedido, (pedido) => pedido.usuario)
    pedidos: Pedido[];
}
