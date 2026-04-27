-- Thêm bảng posts cho tính năng blog
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(500),
  views INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Thêm trường admin_reply vào bảng reviews
ALTER TABLE reviews ADD COLUMN admin_reply TEXT NULL AFTER comment;

-- Thêm dữ liệu mẫu cho posts
INSERT INTO posts (title, excerpt, content, category, image_url, views) VALUES
('Top 5 điểm đến mùa hè 2024 không thể bỏ qua', 'Khám phá những điểm đến tuyệt vời nhất cho kỳ nghỉ hè của bạn cùng gia đình và bạn bè...', 'Nội dung chi tiết về top 5 điểm đến mùa hè 2024 sẽ được cập nhật sau...', 'Du lịch', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 1234),
('Kinh nghiệm đi Đà Nẵng tự túc tiết kiệm nhất', 'Hướng dẫn chi tiết cách đi Đà Nẵng tự túc với chi phí thấp nhưng trải nghiệm tuyệt vời...', 'Nội dung chi tiết về kinh nghiệm đi Đà Nẵng sẽ được cập nhật sau...', 'Hướng dẫn', 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800', 856),
('Những món ăn đặc sản Hà Nội phải thử', 'Tổng hợp những món ăn ngon nhất, đặc sản nhất của thủ đô Hà Nội mà du khách không thể bỏ qua...', 'Nội dung chi tiết về món ăn Hà Nội sẽ được cập nhật sau...', 'Ẩm thực', 'https://images.unsplash.com/photo-1569550270262-13c28e2e56c6?w=800', 2341);
