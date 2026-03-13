package de.portalcore.repository;

import de.portalcore.entity.NachrichtItem;
import de.portalcore.enums.NachrichtTyp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NachrichtItemRepository extends JpaRepository<NachrichtItem, String> {

    List<NachrichtItem> findByTenantIdOrderByErstelltAmDesc(String tenantId);

    List<NachrichtItem> findByTenantIdAndTypOrderByErstelltAmDesc(String tenantId, NachrichtTyp typ);

    List<NachrichtItem> findByErstellerIdOrderByErstelltAmDesc(String erstellerId);

    @Query("SELECT n FROM NachrichtItem n JOIN n.empfaenger e " +
           "WHERE e.empfaenger.id = :userId AND e.archiviert = false " +
           "ORDER BY n.erstelltAm DESC")
    List<NachrichtItem> findPosteingang(@Param("userId") String userId);

    @Query("SELECT n FROM NachrichtItem n JOIN n.empfaenger e " +
           "WHERE e.empfaenger.id = :userId AND e.archiviert = false AND e.gelesen = false " +
           "ORDER BY n.erstelltAm DESC")
    List<NachrichtItem> findUngelesene(@Param("userId") String userId);

    @Query("SELECT n FROM NachrichtItem n JOIN n.empfaenger e " +
           "WHERE e.empfaenger.id = :userId AND e.archiviert = true " +
           "ORDER BY n.erstelltAm DESC")
    List<NachrichtItem> findArchiviert(@Param("userId") String userId);

    @Query("SELECT n FROM NachrichtItem n " +
           "WHERE n.ersteller.id = :userId " +
           "ORDER BY n.erstelltAm DESC")
    List<NachrichtItem> findGesendet(@Param("userId") String userId);

    @Query("SELECT n FROM NachrichtItem n JOIN n.empfaenger e " +
           "WHERE e.empfaenger.id = :userId AND n.typ = :typ AND e.archiviert = false " +
           "ORDER BY n.erstelltAm DESC")
    List<NachrichtItem> findByTypForUser(@Param("userId") String userId, @Param("typ") NachrichtTyp typ);

    @Query("SELECT COUNT(n) FROM NachrichtItem n JOIN n.empfaenger e " +
           "WHERE e.empfaenger.id = :userId AND e.gelesen = false AND e.archiviert = false")
    long countUngelesen(@Param("userId") String userId);
}
