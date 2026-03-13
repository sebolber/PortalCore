package de.portalcore.repository;

import de.portalcore.entity.NachrichtEmpfaenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NachrichtEmpfaengerRepository extends JpaRepository<NachrichtEmpfaenger, String> {

    Optional<NachrichtEmpfaenger> findByNachrichtIdAndEmpfaengerId(String nachrichtId, String empfaengerId);

    @Modifying
    @Query("UPDATE NachrichtEmpfaenger e SET e.gelesen = true, e.gelesenAm = CURRENT_TIMESTAMP " +
           "WHERE e.empfaenger.id = :userId AND e.gelesen = false")
    int markAlleAlsGelesen(@Param("userId") String userId);
}
