SET @column_exists = (
	SELECT COUNT(*)
	FROM INFORMATION_SCHEMA.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'encomenda'
		AND COLUMN_NAME = 'retirado_por'
);

SET @sql = IF(
	@column_exists = 0,
	'ALTER TABLE `encomenda` ADD COLUMN `retirado_por` VARCHAR(150) NULL',
	'SELECT 1'
);

PREPARE add_column FROM @sql;
EXECUTE add_column;
DEALLOCATE PREPARE add_column;