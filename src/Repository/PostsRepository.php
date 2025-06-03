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
}
