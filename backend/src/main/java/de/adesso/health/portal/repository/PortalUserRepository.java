package de.adesso.health.portal.repository;

import de.adesso.health.portal.entity.PortalUser;
import de.adesso.health.portal.enums.UserStatus;
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
