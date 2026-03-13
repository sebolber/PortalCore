package de.portalcore.repository;

import de.portalcore.entity.AppUseCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppUseCaseRepository extends JpaRepository<AppUseCase, String> {

    List<AppUseCase> findByAppId(String appId);

    void deleteByAppId(String appId);
}
