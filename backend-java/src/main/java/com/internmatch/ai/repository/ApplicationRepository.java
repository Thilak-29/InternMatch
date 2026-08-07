package com.internmatch.ai.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class ApplicationRepository {

    private final JdbcTemplate jdbcTemplate;

    public ApplicationRepository(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate=jdbcTemplate;
    }

    public List<Map<String,Object>> findByCompanyId(int companyId){
        return jdbcTemplate.queryForList(
            "SELECT a.*, " +
            "COALESCE(sp.name, u.name, 'Candidate #' || a.student_id) AS candidate_name, " +
            "COALESCE(sp.college, 'Karpagam College of Engineering') AS college, " +
            "COALESCE(sp.degree, 'B.E.') AS degree, " +
            "COALESCE(sp.branch, 'Computer Science & Engineering') AS branch, " +
            "COALESCE(sp.year_of_study, '3rd Year') AS year_of_study, " +
            "COALESCE(sp.skills, 'React, Java, SQL') AS skills, " +
            "COALESCE(sp.cgpa, 8.5) AS cgpa, " +
            "COALESCE(u.email, 'student@example.com') AS email, " +
            "COALESCE(i.title, 'Software Engineering Intern') AS job_title " +
            "FROM applications a " +
            "JOIN internships i ON a.internship_id = i.id " +
            "LEFT JOIN student_profiles sp ON a.student_id = sp.user_id " +
            "LEFT JOIN users u ON a.student_id = u.id " +
            "WHERE i.company_id = ? " +
            "ORDER BY a.id DESC",
            companyId
        );
    }

    public List<Map<String,Object>> findByStudentId(int studentId){
        return jdbcTemplate.queryForList("SELECT a.*,i.title,i.company_name,i.location,i.stipend FROM applications a JOIN internships i ON a.internship_id=i.id WHERE a.student_id=? ORDER BY a.id DESC",studentId);
    }

    public void saveApplication(int studentId, int internshipId){
        jdbcTemplate.update("INSERT INTO applications (student_id,internship_id,status,timeline_stage) VALUES (?,?,'APPLIED','APPLIED')",studentId,internshipId);
    }

    public void updateStatus(int id,String status,String stage){
        jdbcTemplate.update("UPDATE applications SET status=?,timeline_stage=? WHERE id=?",status,stage,id);
    }

    public void updateScoreAndPassed(int id,double score,String status,String stage){
        jdbcTemplate.update("UPDATE applications SET test_score=?,status=?,timeline_stage=? WHERE id=?",score,status,stage,id);
    }
}
