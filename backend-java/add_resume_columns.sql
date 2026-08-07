USE internmatch_db; ALTER TABLE student_profiles ADD COLUMN resume_file_name VARCHAR(255) DEFAULT 'alex_johnson_resume_2025.pdf'; ALTER TABLE student_profiles ADD COLUMN resume_parsed_text TEXT;
