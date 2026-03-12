package de.portalcore.service;

import de.portalcore.entity.BatchJob;
import de.portalcore.enums.BatchStatus;
import de.portalcore.repository.BatchJobRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BatchJobService {

    private final BatchJobRepository batchJobRepository;

    public BatchJobService(BatchJobRepository batchJobRepository) {
        this.batchJobRepository = batchJobRepository;
    }

    public List<BatchJob> findAll() {
        return batchJobRepository.findAll();
    }

    public BatchJob findById(String id) {
        return batchJobRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BatchJob not found with id: " + id));
    }

    @Transactional
    public BatchJob create(BatchJob batchJob) {
        return batchJobRepository.save(batchJob);
    }

    @Transactional
    public BatchJob update(String id, BatchJob updatedJob) {
        BatchJob existing = findById(id);
        existing.setName(updatedJob.getName());
        existing.setBeschreibung(updatedJob.getBeschreibung());
        existing.setProduktId(updatedJob.getProduktId());
        existing.setSchedule(updatedJob.getSchedule());
        existing.setStatus(updatedJob.getStatus());
        existing.setNaechsterLauf(updatedJob.getNaechsterLauf());
        existing.setDauer(updatedJob.getDauer());
        existing.setFortschritt(updatedJob.getFortschritt());
        existing.setProtokoll(updatedJob.getProtokoll());
        return batchJobRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!batchJobRepository.existsById(id)) {
            throw new EntityNotFoundException("BatchJob not found with id: " + id);
        }
        batchJobRepository.deleteById(id);
    }

    @Transactional
    public BatchJob start(String id) {
        BatchJob job = findById(id);
        job.setStatus(BatchStatus.LAEUFT);
        job.setGestartetUm(LocalDateTime.now());
        job.setBeendetUm(null);
        job.setFortschritt(0);
        return batchJobRepository.save(job);
    }

    @Transactional
    public BatchJob pause(String id) {
        BatchJob job = findById(id);
        if (job.getStatus() != BatchStatus.LAEUFT) {
            throw new IllegalStateException("BatchJob can only be paused when running. Current status: " + job.getStatus());
        }
        job.setStatus(BatchStatus.PAUSIERT);
        return batchJobRepository.save(job);
    }

    @Transactional
    public BatchJob stop(String id) {
        BatchJob job = findById(id);
        if (job.getStatus() != BatchStatus.LAEUFT && job.getStatus() != BatchStatus.PAUSIERT) {
            throw new IllegalStateException("BatchJob can only be stopped when running or paused. Current status: " + job.getStatus());
        }
        job.setStatus(BatchStatus.GESTOPPT);
        job.setBeendetUm(LocalDateTime.now());
        return batchJobRepository.save(job);
    }

    @Transactional
    public BatchJob restart(String id) {
        BatchJob job = findById(id);
        job.setStatus(BatchStatus.LAEUFT);
        job.setGestartetUm(LocalDateTime.now());
        job.setBeendetUm(null);
        job.setFortschritt(0);
        return batchJobRepository.save(job);
    }

    public List<BatchJob> getQueue() {
        return batchJobRepository.findByStatus(BatchStatus.WARTEND);
    }

    public List<BatchJob> findByStatus(BatchStatus status) {
        return batchJobRepository.findByStatus(status);
    }
}
