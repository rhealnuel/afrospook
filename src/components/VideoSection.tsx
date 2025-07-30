'use client';

import React from 'react';

export default function VideoSection() {
  return (
    <div className="mb-14">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Watch Our Promo</h2>
      <div className="flex justify-center">
        <video
          controls
          className="rounded-lg w-full max-w-3xl shadow-lg"
          poster="/poster.jpg" // Optional: Add a poster image
        >
          <source src="/afro.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
