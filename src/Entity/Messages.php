<?php

namespace App\Entity;

use App\Repository\MessagesRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MessagesRepository::class)]
class Messages
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Users $fk_user1 = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Users $fk_user2 = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $content_text = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $content_multimedia = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFkUser1(): ?Users
    {
        return $this->fk_user1;
    }

    public function setFkUser1(?Users $fk_user1): static
    {
        $this->fk_user1 = $fk_user1;

        return $this;
    }

    public function getFkUser2(): ?Users
    {
        return $this->fk_user2;
    }

    public function setFkUser2(?Users $fk_user2): static
    {
        $this->fk_user2 = $fk_user2;

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

    public function getContentMultimedia(): ?string
    {
        return $this->content_multimedia;
    }

    public function setContentMultimedia(?string $content_multimedia): static
    {
        $this->content_multimedia = $content_multimedia;

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
