package de.portalcore.repository;

import de.portalcore.entity.SmtpKonfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SmtpKonfigurationRepository extends JpaRepository<SmtpKonfiguration, String> {
}
