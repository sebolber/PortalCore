package de.portalcore.repository;

import de.portalcore.entity.GruppenBerechtigung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GruppenBerechtigungRepository extends JpaRepository<GruppenBerechtigung, String> {

    List<GruppenBerechtigung> findByGruppeId(String gruppeId);

    @Query("SELECT gb FROM GruppenBerechtigung gb WHERE gb.gruppe.id IN " +
           "(SELECT g.id FROM Gruppe g JOIN g.benutzer u WHERE u.id = :userId)")
    List<GruppenBerechtigung> findByUserId(String userId);

    @Query("SELECT gb FROM GruppenBerechtigung gb WHERE gb.gruppe.id IN " +
           "(SELECT g.id FROM Gruppe g JOIN g.benutzer u WHERE u.id = :userId) " +
           "AND gb.useCase = :useCase")
    List<GruppenBerechtigung> findByUserIdAndUseCase(String userId, String useCase);
}
