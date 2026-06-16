-- CreateTable
CREATE TABLE `Usuario` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(30) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_codigo_key`(`codigo`),
    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Funcionario` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(30) NULL,
    `cargo` ENUM('recebimento', 'administrador', 'porteiro', 'supervisor') NOT NULL DEFAULT 'recebimento',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Funcionario_codigo_key`(`codigo`),
    UNIQUE INDEX `Funcionario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatusEncomenda` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome_status` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(255) NULL,

    UNIQUE INDEX `StatusEncomenda_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Remetente` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `tipo` ENUM('correios', 'transportadora', 'ecommerce', 'outro') NOT NULL DEFAULT 'outro',
    `site` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Remetente_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NomeAlternativo` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `usuario_id` CHAR(36) NOT NULL,
    `nome_completo` VARCHAR(150) NOT NULL,
    `documento` VARCHAR(20) NULL,
    `parentesco` ENUM('pai', 'mae', 'irmao', 'irma', 'responsavel', 'outro') NOT NULL DEFAULT 'outro',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NomeAlternativo_codigo_key`(`codigo`),
    INDEX `NomeAlternativo_usuario_id_fkey`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Encomenda` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `codigo_rastreio` VARCHAR(50) NULL,
    `descricao` VARCHAR(255) NULL,
    `destinatario_usuario_id` CHAR(36) NOT NULL,
    `remetente_id` CHAR(36) NULL,
    `funcionario_id` CHAR(36) NOT NULL,
    `status_atual_id` CHAR(36) NOT NULL,
    `data_entrega` DATETIME(3) NULL,
    `observacoes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Encomenda_codigo_key`(`codigo`),
    INDEX `Encomenda_codigo_rastreio_idx`(`codigo_rastreio`),
    INDEX `Encomenda_destinatario_usuario_id_idx`(`destinatario_usuario_id`),
    INDEX `Encomenda_funcionario_id_fkey`(`funcionario_id`),
    INDEX `Encomenda_remetente_id_fkey`(`remetente_id`),
    INDEX `Encomenda_status_atual_id_fkey`(`status_atual_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoricoStatus` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `encomenda_id` CHAR(36) NOT NULL,
    `status_id` CHAR(36) NOT NULL,
    `alterado_por` CHAR(36) NOT NULL,
    `data_alteracao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `HistoricoStatus_codigo_key`(`codigo`),
    INDEX `HistoricoStatus_encomenda_id_idx`(`encomenda_id`),
    INDEX `HistoricoStatus_alterado_por_fkey`(`alterado_por`),
    INDEX `HistoricoStatus_status_id_fkey`(`status_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacao` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `usuario_id` CHAR(36) NOT NULL,
    `encomenda_id` CHAR(36) NOT NULL,
    `tipo` VARCHAR(20) NULL,
    `mensagem` VARCHAR(255) NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Notificacao_codigo_key`(`codigo`),
    INDEX `Notificacao_usuario_id_idx`(`usuario_id`),
    INDEX `Notificacao_encomenda_id_fkey`(`encomenda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Autorizacao` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `encomenda_id` CHAR(36) NOT NULL,
    `destinatario_id` CHAR(36) NULL,
    `nome_avulso` VARCHAR(150) NULL,
    `documento` VARCHAR(20) NULL,
    `autorizado_por` CHAR(36) NOT NULL,
    `validade` DATETIME(3) NULL,
    `utilizada` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Autorizacao_codigo_key`(`codigo`),
    INDEX `Autorizacao_encomenda_id_idx`(`encomenda_id`),
    INDEX `Autorizacao_autorizado_por_fkey`(`autorizado_por`),
    INDEX `Autorizacao_destinatario_id_fkey`(`destinatario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Auditoria` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `funcionario_id` CHAR(36) NOT NULL,
    `entidade` VARCHAR(100) NULL,
    `entidade_id` CHAR(36) NULL,
    `acao` VARCHAR(50) NULL,
    `descricao` TEXT NULL,
    `ip_usuario` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Auditoria_codigo_key`(`codigo`),
    INDEX `Auditoria_funcionario_id_fkey`(`funcionario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NomeAlternativo` ADD CONSTRAINT `NomeAlternativo_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encomenda` ADD CONSTRAINT `Encomenda_destinatario_usuario_id_fkey` FOREIGN KEY (`destinatario_usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encomenda` ADD CONSTRAINT `Encomenda_funcionario_id_fkey` FOREIGN KEY (`funcionario_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encomenda` ADD CONSTRAINT `Encomenda_remetente_id_fkey` FOREIGN KEY (`remetente_id`) REFERENCES `Remetente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Encomenda` ADD CONSTRAINT `Encomenda_status_atual_id_fkey` FOREIGN KEY (`status_atual_id`) REFERENCES `StatusEncomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoStatus` ADD CONSTRAINT `HistoricoStatus_alterado_por_fkey` FOREIGN KEY (`alterado_por`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoStatus` ADD CONSTRAINT `HistoricoStatus_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `Encomenda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoStatus` ADD CONSTRAINT `HistoricoStatus_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `StatusEncomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `Encomenda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacao` ADD CONSTRAINT `Notificacao_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Autorizacao` ADD CONSTRAINT `Autorizacao_autorizado_por_fkey` FOREIGN KEY (`autorizado_por`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Autorizacao` ADD CONSTRAINT `Autorizacao_destinatario_id_fkey` FOREIGN KEY (`destinatario_id`) REFERENCES `NomeAlternativo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Autorizacao` ADD CONSTRAINT `Autorizacao_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `Encomenda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Auditoria` ADD CONSTRAINT `Auditoria_funcionario_id_fkey` FOREIGN KEY (`funcionario_id`) REFERENCES `Funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
