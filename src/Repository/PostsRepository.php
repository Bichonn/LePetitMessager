<?php

namespace App\Repository;

use App\Entity\Posts;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @extends ServiceEntityRepository<Posts>
 */
class PostsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Posts::class);
    }

    /**
     * @return Paginator<Posts> Returns an array of Posts objects ordered by likes and creation date
     */
    public function findTopPostsPaginated(int $page, int $limit): Paginator
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.fk_user', 'author_user') // Explicitly join the author
            ->leftJoin('p.likes', 'l')
            ->addSelect('author_user') // Ensure author is selected for the main query results
            // ->addSelect('COUNT(l.id) AS HIDDEN like_count_val') // This is not strictly necessary as COUNT(l.id) is used directly in ORDER BY
            ->groupBy('p.id, author_user.id') // Group by post ID and author ID because of the aggregate COUNT(l.id)
            ->orderBy('COUNT(l.id)', 'DESC')               // Order by the count of likes, descending
            ->addOrderBy('p.created_at', 'DESC');              // Then by creation date, descending

        $query = $qb->getQuery()
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        // When using GROUP BY, Doctrine documentation recommends setting fetchJoinCollection to false.
        return new Paginator($query, false);
    }

    /**
     * @return Paginator<Posts> Returns an array of Posts objects ordered by their latest activity (repost or creation).
     */
    public function findFeedPostsPaginated(int $page, int $limit): Paginator
    {
        $qb = $this->createQueryBuilder('p')
            // Select the main post entity and its author
            ->addSelect('author_user')
            ->leftJoin('p.fk_user', 'author_user')
            // Left join with reposts to find the latest repost date
            ->leftJoin('p.reposts', 'r')
            // Define the effective_date for ordering: latest repost or creation date
            ->addSelect('COALESCE(MAX(r.created_at), p.created_at) AS HIDDEN effective_date')
            // Group by post ID and author ID (since author is selected)
            // This is necessary because of the MAX() aggregate function.
            ->groupBy('p.id, author_user.id')
            // Order by the effective_date descending (most recent first)
            ->orderBy('effective_date', 'DESC')
            // As a secondary sort, order by the post's original creation date
            ->addOrderBy('p.created_at', 'DESC');

        $query = $qb->getQuery()
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        // Use Paginator. Set fetchJoinCollection to false due to GROUP BY.
        return new Paginator($query, false);
    }
}
