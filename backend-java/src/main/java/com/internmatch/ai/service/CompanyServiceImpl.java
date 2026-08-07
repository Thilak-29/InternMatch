package com.internmatch.ai.service;

import com.internmatch.ai.repository.ApplicationRepository;
import com.internmatch.ai.repository.InternshipRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CompanyServiceImpl implements CompanyService {

    private final InternshipRepository internshipRepository;
    private final ApplicationRepository applicationRepository;
    private final JdbcTemplate jdbcTemplate;

    public CompanyServiceImpl(InternshipRepository internshipRepository,ApplicationRepository applicationRepository,JdbcTemplate jdbcTemplate){
        this.internshipRepository=internshipRepository;
        this.applicationRepository=applicationRepository;
        this.jdbcTemplate=jdbcTemplate;
    }

    @Override
    public List<Map<String,Object>> getCompanyInternships(int companyId){
        return internshipRepository.findByCompanyId(companyId);
    }

    @Override
    public List<Map<String,Object>> getAllActiveInternships(){
        return internshipRepository.findAllActive();
    }

    @Override
    public Map<String,Object> postInternship(int companyId,String companyName,String title,String domain,String skills,String mode,int gradYear,String loc,String duration,String startDate,String endDate,double stipend,int openings){
        internshipRepository.saveInternship(companyId,companyName,title,domain,skills,mode,gradYear,loc,duration,startDate,endDate,stipend,openings);
        Map<String,Object> resp=new HashMap<>();
        resp.put("success",true);
        resp.put("message","Internship posted successfully in College Oracle Database");
        return resp;
    }

    @Override
    public Map<String,Object> deleteInternship(int id){
        internshipRepository.deleteInternship(id);
        Map<String,Object> resp=new HashMap<>();
        resp.put("success",true);
        resp.put("message","Internship deleted successfully");
        return resp;
    }

    @Override
    public List<Map<String,Object>> getCompanyApplicants(int companyId){
        return applicationRepository.findByCompanyId(companyId);
    }

    @Override
    public Map<String,Object> updateApplicantStatus(int applicationId,String status,String stage){
        applicationRepository.updateStatus(applicationId,status,stage);

        if("ACCEPTED_FOR_TEST".equals(status)||"SHORTLISTED".equals(status)){
            try{
                List<Map<String,Object>> rows=jdbcTemplate.queryForList("SELECT student_id FROM applications WHERE id=?",applicationId);
                if(!rows.isEmpty()){
                    int studentId=((Number)rows.get(0).get("student_id")).intValue();
                    String msg="ACCEPTED_FOR_TEST".equals(status)?"Your application was accepted! Screening test with 20 Aptitude & 3 Coding challenges has been assigned.":"Congratulations! You have received an official joining offer letter for your internship.";
                    jdbcTemplate.update("INSERT INTO notifications (user_id,message,type,is_read) VALUES (?,?,'APPLICATION_ALERT',0)",studentId,msg);
                }
            }catch(Exception e){}
        }

        Map<String,Object> resp=new HashMap<>();
        resp.put("success",true);
        resp.put("status",status);
        resp.put("stage",stage);
        return resp;
    }

    @Override
    public Map<String,Object> getCompanyDashboardStats(int companyId){
        List<Map<String,Object>> internships=internshipRepository.findByCompanyId(companyId);
        List<Map<String,Object>> applicants=applicationRepository.findByCompanyId(companyId);

        int totalPosted=internships.size();
        int totalApplicants=applicants.size();
        int shortlisted=0;
        int interviews=0;
        int offers=0;
        int hires=0;

        for(Map<String,Object> app:applicants){
            String st=(String)app.get("status");
            if("SHORTLISTED".equals(st)||"TEST_PASSED".equals(st))shortlisted++;
            if("INTERVIEW_SCHEDULED".equals(st))interviews++;
            if("OFFER_SENT".equals(st))offers++;
            if("HIRED".equals(st)||"SELECTED".equals(st))hires++;
        }

        Map<String,Object> stats=new HashMap<>();
        stats.put("total_posted",totalPosted);
        stats.put("total_applicants",totalApplicants);
        stats.put("shortlisted",shortlisted);
        stats.put("interviews_scheduled",interviews);
        stats.put("offers_sent",offers);
        stats.put("hires_count",hires);
        stats.put("posted_internships",internships);
        return stats;
    }

    @Override
    public Map<String,Object> createScreeningTest(int internshipId,String title,int passingScore,int duration){
        jdbcTemplate.update("INSERT INTO screening_tests (internship_id,test_title,passing_score,duration_minutes) VALUES (?,?,?,?)",internshipId,title,passingScore,duration);
        Map<String,Object> resp=new HashMap<>();
        resp.put("success",true);
        resp.put("message","Custom proctored screening test created for internship");
        return resp;
    }
}
