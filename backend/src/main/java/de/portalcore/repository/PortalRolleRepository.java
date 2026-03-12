package de.portalcore.repository;

import de.portalcore.entity.PortalRolle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortalRolleRepository extends JpaRepository<PortalRolle, String> {

    Optional<PortalRolle> findByName(String name);

    List<PortalRolle> findBySystemRolleTrue();

    List<PortalRolle> findByScope(String scope);
}
