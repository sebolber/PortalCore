package de.portalcore.repository;

import de.portalcore.entity.PortalTheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PortalThemeRepository extends JpaRepository<PortalTheme, String> {

    Optional<PortalTheme> findByTenantId(String tenantId);

    Optional<PortalTheme> findByTenantIdIsNull();
}
