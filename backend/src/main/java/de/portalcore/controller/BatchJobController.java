package de.portalcore.controller;

import de.portalcore.entity.BatchJob;
import de.portalcore.enums.BatchStatus;
import de.portalcore.service.BatchJobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/batch-jobs")
public class BatchJobController {

    private final BatchJobService batchJobService;

    public BatchJobController(BatchJobService batchJobService) {
        this.batchJobService = batchJobService;
    }

    @GetMapping
    public ResponseEntity<List<BatchJob>> listJobs(
            @RequestParam(required = false) BatchStatus status,
            @RequestParam(required = false) String produktId) {
        List<BatchJob> jobs = batchJobService.listJobs(status, produktId);
        return ResponseEntity.ok(jobs);
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<BatchJob> startJob(@PathVariable String id) {
        BatchJob job = batchJobService.start(id);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{id}/pause")
    public ResponseEntity<BatchJob> pauseJob(@PathVariable String id) {
        BatchJob job = batchJobService.pause(id);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{id}/stop")
    public ResponseEntity<BatchJob> stopJob(@PathVariable String id) {
        BatchJob job = batchJobService.stop(id);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{id}/restart")
    public ResponseEntity<BatchJob> restartJob(@PathVariable String id) {
        BatchJob job = batchJobService.restart(id);
        return ResponseEntity.ok(job);
    }

    @GetMapping("/queue")
    public ResponseEntity<List<BatchJob>> getQueue() {
        List<BatchJob> queue = batchJobService.getQueue();
        return ResponseEntity.ok(queue);
    }

    @DeleteMapping("/queue/{id}")
    public ResponseEntity<Void> removeFromQueue(@PathVariable String id) {
        batchJobService.removeFromQueue(id);
        return ResponseEntity.noContent().build();
    }
}
