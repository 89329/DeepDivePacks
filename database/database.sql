-- Users table schema
CREATE TABLE IF NOT EXISTS users (
    user_Id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    currency INTEGER DEFAULT 1000,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    profile_image_url TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_visibility ON users(is_public);

-- Insert default test account
-- Using OR IGNORE to prevent unique constraint violations
INSERT OR IGNORE INTO users (username, email, password, profile_image_url)
VALUES (
    'testuser', 
    'test@example.com', 
    '$2b$10$A9mpPZkcrO6knvrqX.JcN.4e6ldNGJAFV2Nb/XsenHpiKzNpcY/VG',
    'https://media.discordapp.net/attachments/648492415598067714/970798606766460948/684132343870521352.png?ex=67e66b68&is=67e519e8&hm=d20261cf4dbf40aae957d9bd7359c206837caba3419640927a152f2047293acb&='
);