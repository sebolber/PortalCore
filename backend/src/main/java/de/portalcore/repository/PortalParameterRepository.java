package de.portalcore.repository;

import de.portalcore.entity.PortalParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortalParameterRepository extends JpaRepository<PortalParameter, String> {

    List<PortalParameter> findByAppId(String appId);

    List<PortalParameter> findByGroup(String group);

    List<PortalParameter> findByAppIdAndGroup(String appId, String group);
}
