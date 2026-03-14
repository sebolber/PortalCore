package de.portalcore.repository;

import de.portalcore.entity.SystemInitialisierung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemInitialisierungRepository extends JpaRepository<SystemInitialisierung, String> {
}
