package de.adesso.health.portal.repository;

import de.adesso.health.portal.entity.BatchJob;
import de.adesso.health.portal.enums.BatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchJobRepository extends JpaRepository<BatchJob, String> {

    List<BatchJob> findByStatus(BatchStatus status);

    List<BatchJob> findByProduktId(String produktId);
}
