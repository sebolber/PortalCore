package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.BatchJob;
import de.portalcore.enums.BatchStatus;
import de.portalcore.service.AuditService;
import de.portalcore.service.BatchJobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/batch-jobs")
public class BatchJobController {

    private final BatchJobService batchJobService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public BatchJobController(BatchJobService batchJobService, SecurityHelper securityHelper,
                              AuditService auditService) {
        this.batchJobService = batchJobService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<BatchJob>> listJobs(
            @RequestParam(required = false) BatchStatus status,
            @RequestParam(required = false) String produktId) {
        securityHelper.requireBerechtigung("batch-jobs", "lesen");
        return ResponseEntity.ok(batchJobService.listJobs(status, produktId));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<BatchJob> startJob(@PathVariable String id) {
        securityHelper.requireBerechtigung("batch-jobs", "schreiben");
        BatchJob job = batchJobService.start(id);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BATCH_JOB_GESTARTET", "Batch-Job gestartet: " + id);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{id}/pause")
    public ResponseEntity<BatchJob> pauseJob(@PathVariable String id) {
        securityHelper.requireBerechtigung("batch-jobs", "schreiben");
        BatchJob job = batchJobService.pause(id);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BATCH_JOB_PAUSIERT", "Batch-Job pausiert: " + id);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{id}/stop")
    public ResponseEntity<BatchJob> stopJob(@PathVariable String id) {
        securityHelper.requireBerechtigung("batch-jobs", "schreiben");
        BatchJob job = batchJobService.stop(id);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BATCH_JOB_GESTOPPT", "Batch-Job gestoppt: " + id);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{id}/restart")
    public ResponseEntity<BatchJob> restartJob(@PathVariable String id) {
        securityHelper.requireBerechtigung("batch-jobs", "schreiben");
        BatchJob job = batchJobService.restart(id);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BATCH_JOB_NEUGESTARTET", "Batch-Job neugestartet: " + id);
        return ResponseEntity.ok(job);
    }

    @GetMapping("/queue")
    public ResponseEntity<List<BatchJob>> getQueue() {
        securityHelper.requireBerechtigung("batch-jobs", "lesen");
        return ResponseEntity.ok(batchJobService.getQueue());
    }

    @DeleteMapping("/queue/{id}")
    public ResponseEntity<Void> removeFromQueue(@PathVariable String id) {
        securityHelper.requireBerechtigung("batch-jobs", "loeschen");
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BATCH_JOB_AUS_QUEUE_ENTFERNT", "Batch-Job aus Queue entfernt: " + id);
        batchJobService.removeFromQueue(id);
        return ResponseEntity.noContent().build();
    }
}
