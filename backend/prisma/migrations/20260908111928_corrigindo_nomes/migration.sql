-- CreateTable
CREATE TABLE `usuario` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `ra` VARCHAR(30) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(30) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuario_codigo_key`(`codigo`),
    UNIQUE INDEX `usuario_ra_key`(`ra`),
    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `funcionario` (
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

    UNIQUE INDEX `funcionario_codigo_key`(`codigo`),
    UNIQUE INDEX `funcionario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_encomenda` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome_status` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(255) NULL,

    UNIQUE INDEX `status_encomenda_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `remetente` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `tipo` ENUM('correios', 'transportadora', 'ecommerce', 'outro') NOT NULL DEFAULT 'outro',
    `site` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `remetente_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nome_alternativo` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `usuario_id` CHAR(36) NOT NULL,
    `nome_completo` VARCHAR(150) NOT NULL,
    `documento` VARCHAR(20) NULL,
    `parentesco` ENUM('pai', 'mae', 'irmao', 'irma', 'responsavel', 'outro') NOT NULL DEFAULT 'outro',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nome_alternativo_codigo_key`(`codigo`),
    INDEX `NomeAlternativo_usuario_id_fkey`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `encomenda` (
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

    UNIQUE INDEX `encomenda_codigo_key`(`codigo`),
    INDEX `encomenda_codigo_rastreio_idx`(`codigo_rastreio`),
    INDEX `encomenda_destinatario_usuario_id_idx`(`destinatario_usuario_id`),
    INDEX `Encomenda_funcionario_id_fkey`(`funcionario_id`),
    INDEX `Encomenda_remetente_id_fkey`(`remetente_id`),
    INDEX `Encomenda_status_atual_id_fkey`(`status_atual_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico_status` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `encomenda_id` CHAR(36) NOT NULL,
    `status_id` CHAR(36) NOT NULL,
    `alterado_por` CHAR(36) NOT NULL,
    `data_alteracao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `historico_status_codigo_key`(`codigo`),
    INDEX `historico_status_encomenda_id_idx`(`encomenda_id`),
    INDEX `HistoricoStatus_alterado_por_fkey`(`alterado_por`),
    INDEX `HistoricoStatus_status_id_fkey`(`status_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacao` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `usuario_id` CHAR(36) NOT NULL,
    `encomenda_id` CHAR(36) NOT NULL,
    `tipo` VARCHAR(20) NULL,
    `mensagem` VARCHAR(255) NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `notificacao_codigo_key`(`codigo`),
    INDEX `notificacao_usuario_id_idx`(`usuario_id`),
    INDEX `Notificacao_encomenda_id_fkey`(`encomenda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `autorizacao` (
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

    UNIQUE INDEX `autorizacao_codigo_key`(`codigo`),
    INDEX `autorizacao_encomenda_id_idx`(`encomenda_id`),
    INDEX `Autorizacao_autorizado_por_fkey`(`autorizado_por`),
    INDEX `Autorizacao_destinatario_id_fkey`(`destinatario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditoria` (
    `id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `funcionario_id` CHAR(36) NOT NULL,
    `entidade` VARCHAR(100) NULL,
    `entidade_id` CHAR(36) NULL,
    `acao` VARCHAR(50) NULL,
    `descricao` TEXT NULL,
    `ip_usuario` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `auditoria_codigo_key`(`codigo`),
    INDEX `Auditoria_funcionario_id_fkey`(`funcionario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `nome_alternativo` ADD CONSTRAINT `nome_alternativo_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomenda` ADD CONSTRAINT `encomenda_destinatario_usuario_id_fkey` FOREIGN KEY (`destinatario_usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomenda` ADD CONSTRAINT `encomenda_funcionario_id_fkey` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomenda` ADD CONSTRAINT `encomenda_remetente_id_fkey` FOREIGN KEY (`remetente_id`) REFERENCES `remetente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomenda` ADD CONSTRAINT `encomenda_status_atual_id_fkey` FOREIGN KEY (`status_atual_id`) REFERENCES `status_encomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_status` ADD CONSTRAINT `historico_status_alterado_por_fkey` FOREIGN KEY (`alterado_por`) REFERENCES `funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_status` ADD CONSTRAINT `historico_status_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `encomenda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_status` ADD CONSTRAINT `historico_status_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status_encomenda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacao` ADD CONSTRAINT `notificacao_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `encomenda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacao` ADD CONSTRAINT `notificacao_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autorizacao` ADD CONSTRAINT `autorizacao_autorizado_por_fkey` FOREIGN KEY (`autorizado_por`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autorizacao` ADD CONSTRAINT `autorizacao_destinatario_id_fkey` FOREIGN KEY (`destinatario_id`) REFERENCES `nome_alternativo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `autorizacao` ADD CONSTRAINT `autorizacao_encomenda_id_fkey` FOREIGN KEY (`encomenda_id`) REFERENCES `encomenda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_funcionario_id_fkey` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
