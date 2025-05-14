<?php

namespace App\Entity;

use App\Repository\FollowsRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FollowsRepository::class)]
class Follows
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'follows')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Users $fk_follower = null;

    #[ORM\ManyToOne(inversedBy: 'follows')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Users $fk_following = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFkFollower(): ?Users
    {
        return $this->fk_follower;
    }

    public function setFkFollower(?Users $fk_follower): static
    {
        $this->fk_follower = $fk_follower;

        return $this;
    }

    public function getFkFollowing(): ?Users
    {
        return $this->fk_following;
    }

    public function setFkFollowing(?Users $fk_following): static
    {
        $this->fk_following = $fk_following;

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
