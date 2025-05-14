<?php

namespace App\Entity;

use App\Repository\AccountsReportsRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AccountsReportsRepository::class)]
class AccountsReports
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'accountsReports')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Users $fk_reporter = null;

    #[ORM\ManyToOne(inversedBy: 'accountsReports')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Users $fk_reported = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $content = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFkReporter(): ?Users
    {
        return $this->fk_reporter;
    }

    public function setFkReporter(?Users $fk_reporter): static
    {
        $this->fk_reporter = $fk_reporter;

        return $this;
    }

    public function getFkReported(): ?Users
    {
        return $this->fk_reported;
    }

    public function setFkReported(?Users $fk_reported): static
    {
        $this->fk_reported = $fk_reported;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }
}
