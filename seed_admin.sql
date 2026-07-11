-- =========================================================================
-- MONARCA COFFEE POS - SCRIPT DE INICIALIZACIÓN (ESQUEMA REAL SUPABASE)
-- =========================================================================
-- Habilitar extensión pgcrypto para cifrado bcrypt nativo
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Insertar Estados básicos (si no existen)
INSERT INTO estado (nombre, ambito, descripcion, "D_E_L_E_T_E_D")
SELECT 'ACTIVO', 'GENERAL', 'Estado activo general', false
WHERE NOT EXISTS (SELECT 1 FROM estado WHERE nombre = 'ACTIVO' AND ambito = 'GENERAL');

INSERT INTO estado (nombre, ambito, descripcion, "D_E_L_E_T_E_D")
SELECT 'PENDIENTE', 'PEDIDO', 'Pedido pendiente de cobro', false
WHERE NOT EXISTS (SELECT 1 FROM estado WHERE nombre = 'PENDIENTE' AND ambito = 'PEDIDO');

INSERT INTO estado (nombre, ambito, descripcion, "D_E_L_E_T_E_D")
SELECT 'PAGADO', 'PEDIDO', 'Pedido pagado y finalizado', false
WHERE NOT EXISTS (SELECT 1 FROM estado WHERE nombre = 'PAGADO' AND ambito = 'PEDIDO');

-- 2. Insertar Roles (ADMINISTRADOR y MESERO) con id_estado apuntando a ACTIVO
INSERT INTO rol (nombre, id_estado, "D_E_L_E_T_E_D")
SELECT 'ADMINISTRADOR', (SELECT id FROM estado WHERE nombre = 'ACTIVO' AND ambito = 'GENERAL' LIMIT 1), false
WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'ADMINISTRADOR');

INSERT INTO rol (nombre, id_estado, "D_E_L_E_T_E_D")
SELECT 'MESERO', (SELECT id FROM estado WHERE nombre = 'ACTIVO' AND ambito = 'GENERAL' LIMIT 1), false
WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'MESERO');

-- 3. Insertar la Persona y el Usuario Administrador (usuario: admin | contraseña: admin123)
WITH nueva_persona AS (
  INSERT INTO persona (nombre, apellido, telefono, email, id_estado, "D_E_L_E_T_E_D")
  SELECT 'Admin', 'Monarca', '70000000', 'admin@monarcacoffee.com',
         (SELECT id FROM estado WHERE nombre = 'ACTIVO' AND ambito = 'GENERAL' LIMIT 1), false
  WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'admin')
  RETURNING id
)
INSERT INTO usuario (username, password, id_persona, id_rol, id_estado, "D_E_L_E_T_E_D")
SELECT 
  'admin',
  crypt('admin123', gen_salt('bf')), -- Supabase/PostgreSQL genera directamente el hash bcrypt
  nueva_persona.id,
  (SELECT id FROM rol WHERE nombre = 'ADMINISTRADOR' LIMIT 1),
  (SELECT id FROM estado WHERE nombre = 'ACTIVO' AND ambito = 'GENERAL' LIMIT 1),
  false
FROM nueva_persona;
