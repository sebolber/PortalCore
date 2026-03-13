package de.portalcore.repository;

import de.portalcore.entity.UserTenant;
import de.portalcore.entity.UserTenantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTenantRepository extends JpaRepository<UserTenant, UserTenantId> {

    List<UserTenant> findByUserId(String userId);

    List<UserTenant> findByTenantId(String tenantId);

    Optional<UserTenant> findByUserIdAndIstStandardTrue(String userId);

    boolean existsByUserIdAndTenantId(String userId, String tenantId);
}
