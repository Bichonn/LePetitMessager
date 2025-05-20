<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250517164100 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            ALTER TABLE users ADD roles JSON NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users ADD is_verified BOOLEAN NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users ALTER bio SET NOT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            ALTER TABLE users DROP roles
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users DROP is_verified
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users ALTER bio DROP NOT NULL
        SQL);
    }
}
