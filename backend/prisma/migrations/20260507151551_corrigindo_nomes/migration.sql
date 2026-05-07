/*
  Warnings:

  - You are about to drop the `autorizacoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `encomendas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `funcionarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `historico_status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nomes_alternativos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notificacoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `remetentes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `status_encomenda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `auditoria` DROP FOREIGN KEY `auditoria_funcionario_id_fkey`;

-- DropForeignKey
ALTER TABLE `autorizacoes` DROP FOREIGN KEY `autorizacoes_autorizado_por_fkey`;

-- DropForeignKey
ALTER TABLE `autorizacoes` DROP FOREIGN KEY `autorizacoes_destinatario_id_fkey`;

-- DropForeignKey
ALTER TABLE `autorizacoes` DROP FOREIGN KEY `autorizacoes_encomenda_id_fkey`;

-- DropForeignKey
ALTER TABLE `encomendas` DROP FOREIGN KEY `encomendas_destinatario_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `encomendas` DROP FOREIGN KEY `encomendas_funcionario_id_fkey`;

-- DropForeignKey
ALTER TABLE `encomendas` DROP FOREIGN KEY `encomendas_remetente_id_fkey`;

-- DropForeignKey
ALTER TABLE `encomendas` DROP FOREIGN KEY `encomendas_status_atual_id_fkey`;

-- DropForeignKey
ALTER TABLE `historico_status` DROP FOREIGN KEY `historico_status_alterado_por_fkey`;

-- DropForeignKey
ALTER TABLE `historico_status` DROP FOREIGN KEY `historico_status_encomenda_id_fkey`;

-- DropForeignKey
ALTER TABLE `historico_status` DROP FOREIGN KEY `historico_status_status_id_fkey`;

-- DropForeignKey
ALTER TABLE `nomes_alternativos` DROP FOREIGN KEY `nomes_alternativos_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `notificacoes` DROP FOREIGN KEY `notificacoes_encomenda_id_fkey`;

-- DropForeignKey
ALTER TABLE `notificacoes` DROP FOREIGN KEY `notificacoes_usuario_id_fkey`;

-- DropTable
DROP TABLE `autorizacoes`;

-- DropTable
DROP TABLE `encomendas`;

-- DropTable
DROP TABLE `funcionarios`;

-- DropTable
DROP TABLE `historico_status`;

-- DropTable
DROP TABLE `nomes_alternativos`;

-- DropTable
DROP TABLE `notificacoes`;

-- DropTable
DROP TABLE `remetentes`;

-- DropTable
DROP TABLE `status_encomenda`;

-- DropTable
DROP TABLE `usuarios`;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(30) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Funcionario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(30) NULL,
    `cargo` ENUM('recebimento', 'administrador', 'porteiro', 'supervisor') NOT NULL DEFAULT 'recebimento',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Funcionario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatusEncomenda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_status` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Remetente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `tipo` ENUM('correios', 'transportadora', 'ecommerce', 'outro') NOT NULL DEFAULT 'outro',
    `site` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NomeAlternativo` (
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
CREATE TABLE `Encomenda` (
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

    INDEX `Encomenda_codigo_rastreio_idx`(`codigo_rastreio`),
    INDEX `Encomenda_destinatario_usuario_id_idx`(`destinatario_usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoricoStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encomenda_id` INTEGER NOT NULL,
    `status_id` INTEGER NOT NULL,
    `alterado_por` INTEGER NOT NULL,
    `data_alteracao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HistoricoStatus_encomenda_id_idx`(`encomenda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `encomenda_id` INTEGER NOT NULL,
    `tipo` VARCHAR(20) NULL,
    `mensagem` VARCHAR(255) NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notificacao_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Autorizacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encomenda_id` INTEGER NOT NULL,
    `destinatario_id` INTEGER NULL,
    `nome_avulso` VARCHAR(150) NULL,
    `documento` VARCHAR(20) NULL,
    `autorizado_por` INTEGER NOT NULL,
    `validade` DATETIME(3) NULL,
    `utilizada` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Autorizacao_encomenda_id_idx`(`encomenda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NomeAlternativo` ADD CONSTRAINT `NomeAlternativo_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encomenda` ADD CONSTRAINT `Encomenda_destinatario_usuario_id_fkey` FOREIGN KEY (`destinatario_usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encomenda` ADD CONSTRAINT `Encomenda_remetente_id_fkey` FOREIGN KEY (`remetente_id`) REFERENCES `Remetente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encomenda` ADD CONSTRAINT `Encomenda_funcionario_id_fkey` FOREIGN KEY (`funcionario_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encomenda` ADD CONSTRAINT `Encomenda_status_atual_id_fkey` FOREIGN KEY (`status_atual_id`) REFERENCES `StatusEncomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoStatus` ADD CONSTRAINT `HistoricoStatus_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `Encomenda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoStatus` ADD CONSTRAINT `HistoricoStatus_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `StatusEncomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoStatus` ADD CONSTRAINT `HistoricoStatus_alterado_por_fkey` FOREIGN KEY (`alterado_por`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `Encomenda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Autorizacao` ADD CONSTRAINT `Autorizacao_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `Encomenda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Autorizacao` ADD CONSTRAINT `Autorizacao_destinatario_id_fkey` FOREIGN KEY (`destinatario_id`) REFERENCES `NomeAlternativo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Autorizacao` ADD CONSTRAINT `Autorizacao_autorizado_por_fkey` FOREIGN KEY (`autorizado_por`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Auditoria` ADD CONSTRAINT `Auditoria_funcionario_id_fkey` FOREIGN KEY (`funcionario_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
