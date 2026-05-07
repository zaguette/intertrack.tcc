-- CreateTable
CREATE TABLE `tiposusuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_tipo` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `tipo_id` INTEGER NOT NULL,
    `telefone` VARCHAR(30) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `remetentes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `tipo` ENUM('correios', 'transportadora', 'ecommerce', 'outro') NOT NULL,
    `site` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statusencomenda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_status` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `encomenda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_rastreio` VARCHAR(50) NULL,
    `remetente_id` INTEGER NULL,
    `descricao` VARCHAR(255) NULL,
    `funcionario_id` INTEGER NOT NULL,
    `destinatario_usuario_id` INTEGER NOT NULL,
    `status_atual_id` INTEGER NOT NULL,
    `data_entrega` DATETIME(3) NULL,
    `observacoes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historicocostatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encomenda_id` INTEGER NOT NULL,
    `status_id` INTEGER NOT NULL,
    `alterado_por` INTEGER NOT NULL,
    `data_alteracao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `destinatarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `nome_completo` VARCHAR(150) NOT NULL,
    `documento` VARCHAR(20) NULL,
    `parentesco` ENUM('proprio', 'pai', 'mae', 'irmao', 'irma', 'responsavel', 'outro') NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

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

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `mensagem` VARCHAR(255) NOT NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `entidade` VARCHAR(100) NOT NULL,
    `entidade_id` INTEGER NOT NULL,
    `acao` VARCHAR(50) NOT NULL,
    `descricao` TEXT NULL,
    `ip_usuario` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_tipo_id_fkey` FOREIGN KEY (`tipo_id`) REFERENCES `tiposusuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomenda` ADD CONSTRAINT `encomenda_remetente_id_fkey` FOREIGN KEY (`remetente_id`) REFERENCES `remetentes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomenda` ADD CONSTRAINT `encomenda_funcionario_id_fkey` FOREIGN KEY (`funcionario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomenda` ADD CONSTRAINT `encomenda_destinatario_usuario_id_fkey` FOREIGN KEY (`destinatario_usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomenda` ADD CONSTRAINT `encomenda_status_atual_id_fkey` FOREIGN KEY (`status_atual_id`) REFERENCES `statusencomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historicocostatus` ADD CONSTRAINT `historicocostatus_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `encomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historicocostatus` ADD CONSTRAINT `historicocostatus_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `statusencomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historicocostatus` ADD CONSTRAINT `historicocostatus_alterado_por_fkey` FOREIGN KEY (`alterado_por`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `destinatarios` ADD CONSTRAINT `destinatarios_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autorizacoes` ADD CONSTRAINT `autorizacoes_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `encomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autorizacoes` ADD CONSTRAINT `autorizacoes_destinatario_id_fkey` FOREIGN KEY (`destinatario_id`) REFERENCES `destinatarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autorizacoes` ADD CONSTRAINT `autorizacoes_autorizado_por_fkey` FOREIGN KEY (`autorizado_por`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacao` ADD CONSTRAINT `notificacao_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
