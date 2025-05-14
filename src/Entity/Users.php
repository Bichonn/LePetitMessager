<?php

namespace App\Entity;

use App\Repository\UsersRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UsersRepository::class)]
class Users
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $first_name = null;

    #[ORM\Column(length: 70)]
    private ?string $last_name = null;

    #[ORM\Column(length: 50)]
    private ?string $username = null;

    #[ORM\Column(length: 100)]
    private ?string $email = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $bio = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $profile_picture = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $banner = null;

    #[ORM\Column]
    private ?bool $account_ban = null;

    #[ORM\Column]
    private ?bool $user_premium = null;

    #[ORM\Column]
    private ?bool $private_account = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    /**
     * @var Collection<int, Posts>
     */
    #[ORM\OneToMany(targetEntity: Posts::class, mappedBy: 'fk_user', orphanRemoval: true)]
    private Collection $posts;

    /**
     * @var Collection<int, Likes>
     */
    #[ORM\OneToMany(targetEntity: Likes::class, mappedBy: 'fk_user', orphanRemoval: true)]
    private Collection $likes;

    /**
     * @var Collection<int, Reposts>
     */
    #[ORM\OneToMany(targetEntity: Reposts::class, mappedBy: 'fk_user', orphanRemoval: true)]
    private Collection $reposts;

    /**
     * @var Collection<int, Follows>
     */
    #[ORM\OneToMany(targetEntity: Follows::class, mappedBy: 'fk_follower', orphanRemoval: true)]
    private Collection $follows;

    /**
     * @var Collection<int, Comments>
     */
    #[ORM\OneToMany(targetEntity: Comments::class, mappedBy: 'fk_user', orphanRemoval: true)]
    private Collection $comments;

    /**
     * @var Collection<int, PostsReports>
     */
    #[ORM\OneToMany(targetEntity: PostsReports::class, mappedBy: 'fk_user', orphanRemoval: true)]
    private Collection $postsReports;

    /**
     * @var Collection<int, AccountsReports>
     */
    #[ORM\OneToMany(targetEntity: AccountsReports::class, mappedBy: 'fk_reporter')]
    private Collection $accountsReports;

    /**
     * @var Collection<int, Messages>
     */
    #[ORM\OneToMany(targetEntity: Messages::class, mappedBy: 'fk_user1', orphanRemoval: true)]
    private Collection $messages;

    /**
     * @var Collection<int, Favoris>
     */
    #[ORM\OneToMany(targetEntity: Favoris::class, mappedBy: 'fk_user', orphanRemoval: true)]
    private Collection $favoris;

    /**
     * @var Collection<int, Notifications>
     */
    #[ORM\OneToMany(targetEntity: Notifications::class, mappedBy: 'fk_user', orphanRemoval: true)]
    private Collection $notifications;

    public function __construct()
    {
        $this->posts = new ArrayCollection();
        $this->likes = new ArrayCollection();
        $this->reposts = new ArrayCollection();
        $this->follows = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->postsReports = new ArrayCollection();
        $this->accountsReports = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->favoris = new ArrayCollection();
        $this->notifications = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstName(): ?string
    {
        return $this->first_name;
    }

    public function setFirstName(string $first_name): static
    {
        $this->first_name = $first_name;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->last_name;
    }

    public function setLastName(string $last_name): static
    {
        $this->last_name = $last_name;

        return $this;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(string $bio): static
    {
        $this->bio = $bio;

        return $this;
    }

    public function getProfilePicture(): ?string
    {
        return $this->profile_picture;
    }

    public function setProfilePicture(?string $profile_picture): static
    {
        $this->profile_picture = $profile_picture;

        return $this;
    }

    public function getBanner(): ?string
    {
        return $this->banner;
    }

    public function setBanner(?string $banner): static
    {
        $this->banner = $banner;

        return $this;
    }

    public function isAccountBan(): ?bool
    {
        return $this->account_ban;
    }

    public function setAccountBan(bool $account_ban): static
    {
        $this->account_ban = $account_ban;

        return $this;
    }

    public function isUserPremium(): ?bool
    {
        return $this->user_premium;
    }

    public function setUserPremium(bool $user_premium): static
    {
        $this->user_premium = $user_premium;

        return $this;
    }

    public function isPrivateAccount(): ?bool
    {
        return $this->private_account;
    }

    public function setPrivateAccount(bool $private_account): static
    {
        $this->private_account = $private_account;

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
     * @return Collection<int, Posts>
     */
    public function getPosts(): Collection
    {
        return $this->posts;
    }

    public function addPost(Posts $post): static
    {
        if (!$this->posts->contains($post)) {
            $this->posts->add($post);
            $post->setFkUser($this);
        }

        return $this;
    }

    public function removePost(Posts $post): static
    {
        if ($this->posts->removeElement($post)) {
            // set the owning side to null (unless already changed)
            if ($post->getFkUser() === $this) {
                $post->setFkUser(null);
            }
        }

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
            $like->setFkUser($this);
        }

        return $this;
    }

    public function removeLike(Likes $like): static
    {
        if ($this->likes->removeElement($like)) {
            // set the owning side to null (unless already changed)
            if ($like->getFkUser() === $this) {
                $like->setFkUser(null);
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
            $repost->setFkUser($this);
        }

        return $this;
    }

    public function removeRepost(Reposts $repost): static
    {
        if ($this->reposts->removeElement($repost)) {
            // set the owning side to null (unless already changed)
            if ($repost->getFkUser() === $this) {
                $repost->setFkUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Follows>
     */
    public function getFollows(): Collection
    {
        return $this->follows;
    }

    public function addFollow(Follows $follow): static
    {
        if (!$this->follows->contains($follow)) {
            $this->follows->add($follow);
            $follow->setFkFollower($this);
        }

        return $this;
    }

    public function removeFollow(Follows $follow): static
    {
        if ($this->follows->removeElement($follow)) {
            // set the owning side to null (unless already changed)
            if ($follow->getFkFollower() === $this) {
                $follow->setFkFollower(null);
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
            $comment->setFkUser($this);
        }

        return $this;
    }

    public function removeComment(Comments $comment): static
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getFkUser() === $this) {
                $comment->setFkUser(null);
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
            $postsReport->setFkUser($this);
        }

        return $this;
    }

    public function removePostsReport(PostsReports $postsReport): static
    {
        if ($this->postsReports->removeElement($postsReport)) {
            // set the owning side to null (unless already changed)
            if ($postsReport->getFkUser() === $this) {
                $postsReport->setFkUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, AccountsReports>
     */
    public function getAccountsReports(): Collection
    {
        return $this->accountsReports;
    }

    public function addAccountsReport(AccountsReports $accountsReport): static
    {
        if (!$this->accountsReports->contains($accountsReport)) {
            $this->accountsReports->add($accountsReport);
            $accountsReport->setFkReporter($this);
        }

        return $this;
    }

    public function removeAccountsReport(AccountsReports $accountsReport): static
    {
        if ($this->accountsReports->removeElement($accountsReport)) {
            // set the owning side to null (unless already changed)
            if ($accountsReport->getFkReporter() === $this) {
                $accountsReport->setFkReporter(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Messages>
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Messages $message): static
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            $message->setFkUser1($this);
        }

        return $this;
    }

    public function removeMessage(Messages $message): static
    {
        if ($this->messages->removeElement($message)) {
            // set the owning side to null (unless already changed)
            if ($message->getFkUser1() === $this) {
                $message->setFkUser1(null);
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
            $favori->setFkUser($this);
        }

        return $this;
    }

    public function removeFavori(Favoris $favori): static
    {
        if ($this->favoris->removeElement($favori)) {
            // set the owning side to null (unless already changed)
            if ($favori->getFkUser() === $this) {
                $favori->setFkUser(null);
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
            $notification->setFkUser($this);
        }

        return $this;
    }

    public function removeNotification(Notifications $notification): static
    {
        if ($this->notifications->removeElement($notification)) {
            // set the owning side to null (unless already changed)
            if ($notification->getFkUser() === $this) {
                $notification->setFkUser(null);
            }
        }

        return $this;
    }
}
