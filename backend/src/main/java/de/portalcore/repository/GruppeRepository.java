package de.portalcore.repository;

import de.portalcore.entity.Gruppe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GruppeRepository extends JpaRepository<Gruppe, String> {

    List<Gruppe> findByTenantIdOrTenantIdIsNull(String tenantId);

    List<Gruppe> findBySystemGruppeTrue();

    List<Gruppe> findByTenantId(String tenantId);

    @Query("SELECT g FROM Gruppe g JOIN g.benutzer u WHERE u.id = :userId")
    List<Gruppe> findByUserId(String userId);

    boolean existsByName(String name);
}
