package de.portalcore.repository;

import de.portalcore.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, String> {

    Optional<OtpCode> findTopByEmailAndVerwendetFalseAndGueltigBisAfterOrderByErstelltAmDesc(
            String email, LocalDateTime now);

    @Query("SELECT COUNT(o) FROM OtpCode o WHERE o.email = :email AND o.erstelltAm > :since")
    long countRecentByEmail(String email, LocalDateTime since);

    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.gueltigBis < :before")
    void deleteExpired(LocalDateTime before);
}
