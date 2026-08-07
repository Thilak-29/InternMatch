package com.internmatch.ai.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class InternshipRepository {

    private final JdbcTemplate jdbcTemplate;

    public InternshipRepository(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate=jdbcTemplate;
    }

    public List<Map<String,Object>> findByCompanyId(int companyId){
        return jdbcTemplate.queryForList("SELECT * FROM internships WHERE company_id=? ORDER BY id DESC",companyId);
    }

    public List<Map<String,Object>> findAllActive(){
        return jdbcTemplate.queryForList("SELECT * FROM internships WHERE status='ACTIVE' ORDER BY id DESC");
    }

    public void saveInternship(int companyId,String companyName,String title,String domain,String skills,String mode,int gradYear,String loc,String duration,String startDate,String endDate,double stipend,int openings){
        jdbcTemplate.update("INSERT INTO internships (company_id,company_name,title,domain,required_skills,work_mode,grad_year,location,duration,start_date,end_date,stipend,openings,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'ACTIVE')",companyId,companyName,title,domain,skills,mode,gradYear,loc,duration,startDate,endDate,stipend,openings);
    }

    public void deleteInternship(int id){
        jdbcTemplate.update("DELETE FROM internships WHERE id=?",id);
    }
}
