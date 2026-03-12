package de.portalcore.repository;

import de.portalcore.entity.PortalUser;
import de.portalcore.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortalUserRepository extends JpaRepository<PortalUser, String> {

    Optional<PortalUser> findByEmail(String email);

    List<PortalUser> findByTenantId(String tenantId);

    List<PortalUser> findByStatus(UserStatus status);

    Optional<PortalUser> findByIamId(String iamId);
}
