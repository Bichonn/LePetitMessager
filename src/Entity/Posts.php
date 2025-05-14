<?php

namespace App\Entity;

use App\Repository\PostsRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PostsRepository::class)]
class Posts
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'posts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Users $fk_user = null;

    #[ORM\Column(length: 1000, nullable: true)]
    private ?string $content_text = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $content_multimedia = null;

    #[ORM\Column(nullable: true)]
    private ?array $metadata = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    /**
     * @var Collection<int, Likes>
     */
    #[ORM\OneToMany(targetEntity: Likes::class, mappedBy: 'fk_post', orphanRemoval: true)]
    private Collection $likes;

    /**
     * @var Collection<int, Reposts>
     */
    #[ORM\OneToMany(targetEntity: Reposts::class, mappedBy: 'fk_post')]
    private Collection $reposts;

    /**
     * @var Collection<int, Comments>
     */
    #[ORM\OneToMany(targetEntity: Comments::class, mappedBy: 'fk_post')]
    private Collection $comments;

    /**
     * @var Collection<int, PostsReports>
     */
    #[ORM\OneToMany(targetEntity: PostsReports::class, mappedBy: 'fk_post', orphanRemoval: true)]
    private Collection $postsReports;

    /**
     * @var Collection<int, Favoris>
     */
    #[ORM\OneToMany(targetEntity: Favoris::class, mappedBy: 'fk_post', orphanRemoval: true)]
    private Collection $favoris;

    /**
     * @var Collection<int, Notifications>
     */
    #[ORM\OneToMany(targetEntity: Notifications::class, mappedBy: 'fk_post')]
    private Collection $notifications;

    public function __construct()
    {
        $this->likes = new ArrayCollection();
        $this->reposts = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->postsReports = new ArrayCollection();
        $this->favoris = new ArrayCollection();
        $this->notifications = new ArrayCollection();
    }

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

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function setMetadata(?array $metadata): static
    {
        $this->metadata = $metadata;

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

    /**
     * @return Collection<int, Likes>
     */
    public function getLikes(): Collection
    {
        return $this->likes;
    }

    public function addLike(Likes $like): static
    {
        if (!$this->likes->contains($like)) {
            $this->likes->add($like);
            $like->setFkPost($this);
        }

        return $this;
    }

    public function removeLike(Likes $like): static
    {
        if ($this->likes->removeElement($like)) {
            // set the owning side to null (unless already changed)
            if ($like->getFkPost() === $this) {
                $like->setFkPost(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Reposts>
     */
    public function getReposts(): Collection
    {
        return $this->reposts;
    }

    public function addRepost(Reposts $repost): static
    {
        if (!$this->reposts->contains($repost)) {
            $this->reposts->add($repost);
            $repost->setFkPost($this);
        }

        return $this;
    }

    public function removeRepost(Reposts $repost): static
    {
        if ($this->reposts->removeElement($repost)) {
            // set the owning side to null (unless already changed)
            if ($repost->getFkPost() === $this) {
                $repost->setFkPost(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Comments>
     */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(Comments $comment): static
    {
        if (!$this->comments->contains($comment)) {
            $this->comments->add($comment);
            $comment->setFkPost($this);
        }

        return $this;
    }

    public function removeComment(Comments $comment): static
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getFkPost() === $this) {
                $comment->setFkPost(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, PostsReports>
     */
    public function getPostsReports(): Collection
    {
        return $this->postsReports;
    }

    public function addPostsReport(PostsReports $postsReport): static
    {
        if (!$this->postsReports->contains($postsReport)) {
            $this->postsReports->add($postsReport);
            $postsReport->setFkPost($this);
        }

        return $this;
    }

    public function removePostsReport(PostsReports $postsReport): static
    {
        if ($this->postsReports->removeElement($postsReport)) {
            // set the owning side to null (unless already changed)
            if ($postsReport->getFkPost() === $this) {
                $postsReport->setFkPost(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Favoris>
     */
    public function getFavoris(): Collection
    {
        return $this->favoris;
    }

    public function addFavori(Favoris $favori): static
    {
        if (!$this->favoris->contains($favori)) {
            $this->favoris->add($favori);
            $favori->setFkPost($this);
        }

        return $this;
    }

    public function removeFavori(Favoris $favori): static
    {
        if ($this->favoris->removeElement($favori)) {
            // set the owning side to null (unless already changed)
            if ($favori->getFkPost() === $this) {
                $favori->setFkPost(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Notifications>
     */
    public function getNotifications(): Collection
    {
        return $this->notifications;
    }

    public function addNotification(Notifications $notification): static
    {
        if (!$this->notifications->contains($notification)) {
            $this->notifications->add($notification);
            $notification->setFkPost($this);
        }

        return $this;
    }

    public function removeNotification(Notifications $notification): static
    {
        if ($this->notifications->removeElement($notification)) {
            // set the owning side to null (unless already changed)
            if ($notification->getFkPost() === $this) {
                $notification->setFkPost(null);
            }
        }

        return $this;
    }
}
