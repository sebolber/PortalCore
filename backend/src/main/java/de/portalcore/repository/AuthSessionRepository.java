package de.portalcore.repository;

import de.portalcore.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuthSessionRepository extends JpaRepository<AuthSession, String> {

    List<AuthSession> findByUserIdAndAktivTrue(String userId);

    @Modifying
    @Query("UPDATE AuthSession s SET s.aktiv = false WHERE s.userId = :userId")
    void deactivateAllByUserId(String userId);

    @Modifying
    @Query("DELETE FROM AuthSession s WHERE s.gueltigBis < :before")
    void deleteExpired(LocalDateTime before);
}
