/*
  Warnings:

  - You are about to drop the column `usuario_id` on the `auditoria` table. All the data in the column will be lost.
  - You are about to drop the `encomenda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `historicostatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nomesentrega` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notificacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `statusencomenda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tiposusuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `funcionario_id` to the `auditoria` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `auditoria` DROP FOREIGN KEY `Auditoria_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `encomenda` DROP FOREIGN KEY `Encomenda_funcionario_id_fkey`;

-- DropForeignKey
ALTER TABLE `encomenda` DROP FOREIGN KEY `Encomenda_nome_entrega_id_fkey`;

-- DropForeignKey
ALTER TABLE `encomenda` DROP FOREIGN KEY `Encomenda_status_atual_id_fkey`;

-- DropForeignKey
ALTER TABLE `historicostatus` DROP FOREIGN KEY `HistoricoStatus_alterado_por_fkey`;

-- DropForeignKey
ALTER TABLE `historicostatus` DROP FOREIGN KEY `HistoricoStatus_encomenda_id_fkey`;

-- DropForeignKey
ALTER TABLE `historicostatus` DROP FOREIGN KEY `HistoricoStatus_status_id_fkey`;

-- DropForeignKey
ALTER TABLE `nomesentrega` DROP FOREIGN KEY `NomesEntrega_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `notificacao` DROP FOREIGN KEY `Notificacao_encomenda_id_fkey`;

-- DropForeignKey
ALTER TABLE `notificacao` DROP FOREIGN KEY `Notificacao_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `Usuario_tipo_id_fkey`;

-- AlterTable
ALTER TABLE `auditoria` DROP COLUMN `usuario_id`,
    ADD COLUMN `funcionario_id` INTEGER NOT NULL,
    MODIFY `entidade` VARCHAR(100) NULL,
    MODIFY `entidade_id` INTEGER NULL,
    MODIFY `acao` VARCHAR(50) NULL;

-- DropTable
DROP TABLE `encomenda`;

-- DropTable
DROP TABLE `historicostatus`;

-- DropTable
DROP TABLE `nomesentrega`;

-- DropTable
DROP TABLE `notificacao`;

-- DropTable
DROP TABLE `statusencomenda`;

-- DropTable
DROP TABLE `tiposusuario`;

-- DropTable
DROP TABLE `usuario`;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(30) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `funcionarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(30) NULL,
    `cargo` ENUM('recebimento', 'administrador', 'porteiro', 'supervisor') NOT NULL DEFAULT 'recebimento',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `funcionarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_encomenda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_status` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `remetentes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `tipo` ENUM('correios', 'transportadora', 'ecommerce', 'outro') NOT NULL DEFAULT 'outro',
    `site` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nomes_alternativos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `nome_completo` VARCHAR(150) NOT NULL,
    `documento` VARCHAR(20) NULL,
    `parentesco` ENUM('pai', 'mae', 'irmao', 'irma', 'responsavel', 'outro') NOT NULL DEFAULT 'outro',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `encomendas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_rastreio` VARCHAR(50) NULL,
    `descricao` VARCHAR(255) NULL,
    `destinatario_usuario_id` INTEGER NOT NULL,
    `remetente_id` INTEGER NULL,
    `funcionario_id` INTEGER NOT NULL,
    `status_atual_id` INTEGER NOT NULL,
    `data_entrega` DATETIME(3) NULL,
    `observacoes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `encomendas_codigo_rastreio_idx`(`codigo_rastreio`),
    INDEX `encomendas_destinatario_usuario_id_idx`(`destinatario_usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encomenda_id` INTEGER NOT NULL,
    `status_id` INTEGER NOT NULL,
    `alterado_por` INTEGER NOT NULL,
    `data_alteracao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `historico_status_encomenda_id_idx`(`encomenda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `encomenda_id` INTEGER NOT NULL,
    `tipo` VARCHAR(20) NULL,
    `mensagem` VARCHAR(255) NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notificacoes_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `autorizacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encomenda_id` INTEGER NOT NULL,
    `destinatario_id` INTEGER NULL,
    `nome_avulso` VARCHAR(150) NULL,
    `documento` VARCHAR(20) NULL,
    `autorizado_por` INTEGER NOT NULL,
    `validade` DATETIME(3) NULL,
    `utilizada` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `autorizacoes_encomenda_id_idx`(`encomenda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `nomes_alternativos` ADD CONSTRAINT `nomes_alternativos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomendas` ADD CONSTRAINT `encomendas_destinatario_usuario_id_fkey` FOREIGN KEY (`destinatario_usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomendas` ADD CONSTRAINT `encomendas_remetente_id_fkey` FOREIGN KEY (`remetente_id`) REFERENCES `remetentes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomendas` ADD CONSTRAINT `encomendas_funcionario_id_fkey` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomendas` ADD CONSTRAINT `encomendas_status_atual_id_fkey` FOREIGN KEY (`status_atual_id`) REFERENCES `status_encomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_status` ADD CONSTRAINT `historico_status_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `encomendas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_status` ADD CONSTRAINT `historico_status_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status_encomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_status` ADD CONSTRAINT `historico_status_alterado_por_fkey` FOREIGN KEY (`alterado_por`) REFERENCES `funcionarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `encomendas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autorizacoes` ADD CONSTRAINT `autorizacoes_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `encomendas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autorizacoes` ADD CONSTRAINT `autorizacoes_destinatario_id_fkey` FOREIGN KEY (`destinatario_id`) REFERENCES `nomes_alternativos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autorizacoes` ADD CONSTRAINT `autorizacoes_autorizado_por_fkey` FOREIGN KEY (`autorizado_por`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_funcionario_id_fkey` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
