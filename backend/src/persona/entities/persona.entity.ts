import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Estado } from 'src/estado/entities/estado.entity';
import { Column, Entity, JoinColumn, OneToOne, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class Persona {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    apellido: string;

    @Column()
    telefono: string;

    @Column()
    email: string;

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

    @OneToOne(() => Usuario, (usuario) => usuario.persona)
    usuario: Usuario;
}
