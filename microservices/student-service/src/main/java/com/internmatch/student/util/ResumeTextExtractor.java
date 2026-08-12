package com.internmatch.student.util;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

public class ResumeTextExtractor {

    private static final Logger log = LoggerFactory.getLogger(ResumeTextExtractor.class);

    public static String extractText(byte[] fileBytes, String fileName) {
        if (fileBytes == null || fileBytes.length == 0) {
            return "";
        }

        String lowerName = fileName != null ? fileName.toLowerCase() : "";

        if (lowerName.endsWith(".pdf")) {
            try (PDDocument document = Loader.loadPDF(fileBytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(document);
                if (text != null && !text.trim().isEmpty()) {
                    log.info("PDF text extraction succeeded for {}, extracted {} characters.", fileName, text.length());
                    return text.trim();
                }
            } catch (Exception e) {
                log.warn("PDFBox text extraction failed for {}: {}", fileName, e.getMessage());
            }
        } else if (lowerName.endsWith(".docx")) {
            try (ByteArrayInputStream bais = new ByteArrayInputStream(fileBytes);
                 XWPFDocument doc = new XWPFDocument(bais);
                 XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                String text = extractor.getText();
                if (text != null && !text.trim().isEmpty()) {
                    log.info("DOCX text extraction succeeded for {}, extracted {} characters.", fileName, text.length());
                    return text.trim();
                }
            } catch (Exception e) {
                log.warn("POI DOCX text extraction failed for {}: {}", fileName, e.getMessage());
            }
        }

        // Plain text fallback
        try {
            String rawStr = new String(fileBytes, StandardCharsets.UTF_8);
            // Check if human-readable printable text
            if (rawStr.replaceAll("[^\\p{Print}\\s]", "").length() > 50) {
                return rawStr.trim();
            }
        } catch (Exception ignored) {}

        return "";
    }
}
