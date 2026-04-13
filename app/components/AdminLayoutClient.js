'use client';

import { useState } from 'react';

export default function AdminLayoutClient({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
