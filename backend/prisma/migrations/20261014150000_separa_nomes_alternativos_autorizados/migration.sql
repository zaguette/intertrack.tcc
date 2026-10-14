ALTER TABLE `nome_alternativo`
  ADD COLUMN `tipo` ENUM('alternativo', 'autorizado') NOT NULL DEFAULT 'alternativo';

UPDATE `nome_alternativo`
SET `tipo` = 'autorizado';