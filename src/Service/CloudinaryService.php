<?php

namespace App\Service;

use Cloudinary\Cloudinary;

class CloudinaryService
{
    private Cloudinary $cloudinary;

    public function __construct(string $cloudinaryUrl)
    {
        if (empty($cloudinaryUrl)) {
            throw new \InvalidArgumentException('Cloudinary URL must be configured. Please set the CLOUDINARY_URL environment variable.');
        }
        $this->cloudinary = new Cloudinary($cloudinaryUrl);
    }

    public function getCloudinary(): Cloudinary
    {
        return $this->cloudinary;
    }
}