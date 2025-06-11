<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250611024616 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE TABLE posts_hashtags (posts_id INT NOT NULL, hashtags_id INT NOT NULL, PRIMARY KEY(posts_id, hashtags_id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_FB2EF326D5E258C5 ON posts_hashtags (posts_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_FB2EF32665827D0B ON posts_hashtags (hashtags_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            ALTER TABLE posts_hashtags DROP CONSTRAINT FK_FB2EF326D5E258C5
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE posts_hashtags DROP CONSTRAINT FK_FB2EF32665827D0B
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE posts_hashtags
        SQL);
    }
}
