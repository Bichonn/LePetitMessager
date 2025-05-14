<?php

namespace App\Entity;

use App\Repository\RepostsRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RepostsRepository::class)]
class Reposts
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'reposts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Users $fk_user = null;

    #[ORM\ManyToOne(inversedBy: 'reposts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Posts $fk_post = null;

    #[ORM\Column(length: 1000, nullable: true)]
    private ?string $content_text = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFkUser(): ?Users
    {
        return $this->fk_user;
    }

    public function setFkUser(?Users $fk_user): static
    {
        $this->fk_user = $fk_user;

        return $this;
    }

    public function getFkPost(): ?Posts
    {
        return $this->fk_post;
    }

    public function setFkPost(?Posts $fk_post): static
    {
        $this->fk_post = $fk_post;

        return $this;
    }

    public function getContentText(): ?string
    {
        return $this->content_text;
    }

    public function setContentText(?string $content_text): static
    {
        $this->content_text = $content_text;

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
