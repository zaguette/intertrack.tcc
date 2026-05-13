-- CreateTable
CREATE TABLE `TiposUsuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_tipo` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `tipo_id` INTEGER NOT NULL,
    `telefone` VARCHAR(30) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NomesEntrega` (
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
CREATE TABLE `Encomenda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_rastreio` VARCHAR(50) NULL,
    `descricao` VARCHAR(255) NULL,
    `nome_entrega_id` INTEGER NOT NULL,
    `funcionario_id` INTEGER NOT NULL,
    `status_atual_id` INTEGER NOT NULL,
    `data_entrega` DATETIME(3) NULL,
    `observacoes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

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
CREATE TABLE `HistoricoStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `encomenda_id` INTEGER NOT NULL,
    `status_id` INTEGER NOT NULL,
    `alterado_por` INTEGER NOT NULL,
    `data_alteracao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `encomenda_id` INTEGER NOT NULL,
    `tipo` VARCHAR(20) NULL,
    `mensagem` VARCHAR(255) NOT NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Auditoria` (
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
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_tipo_id_fkey` FOREIGN KEY (`tipo_id`) REFERENCES `TiposUsuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NomesEntrega` ADD CONSTRAINT `NomesEntrega_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encomenda` ADD CONSTRAINT `Encomenda_nome_entrega_id_fkey` FOREIGN KEY (`nome_entrega_id`) REFERENCES `NomesEntrega`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encomenda` ADD CONSTRAINT `Encomenda_funcionario_id_fkey` FOREIGN KEY (`funcionario_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encomenda` ADD CONSTRAINT `Encomenda_status_atual_id_fkey` FOREIGN KEY (`status_atual_id`) REFERENCES `StatusEncomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoStatus` ADD CONSTRAINT `HistoricoStatus_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `Encomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoStatus` ADD CONSTRAINT `HistoricoStatus_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `StatusEncomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoStatus` ADD CONSTRAINT `HistoricoStatus_alterado_por_fkey` FOREIGN KEY (`alterado_por`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `Encomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Auditoria` ADD CONSTRAINT `Auditoria_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
