package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.NachrichtAnhang;
import de.portalcore.entity.NachrichtEmpfaenger;
import de.portalcore.entity.NachrichtItem;
import de.portalcore.enums.NachrichtPrioritaet;
import de.portalcore.enums.NachrichtTyp;
import de.portalcore.service.AuditService;
import de.portalcore.service.NachrichtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/nachricht")
public class NachrichtController {

    private final NachrichtService nachrichtService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public NachrichtController(NachrichtService nachrichtService, SecurityHelper securityHelper,
                               AuditService auditService) {
        this.nachrichtService = nachrichtService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping("/posteingang")
    public ResponseEntity<List<NachrichtItemDto>> getPosteingang(
            @RequestParam(required = false) NachrichtTyp typ) {
        String userId = securityHelper.getCurrentUserId();
        List<NachrichtItem> items;
        if (typ != null) {
            items = nachrichtService.getByTyp(userId, typ);
        } else {
            items = nachrichtService.getPosteingang(userId);
        }
        return ResponseEntity.ok(items.stream().map(n -> toDto(n, userId)).toList());
    }

    @GetMapping("/gesendet")
    public ResponseEntity<List<NachrichtItemDto>> getGesendet() {
        String userId = securityHelper.getCurrentUserId();
        return ResponseEntity.ok(nachrichtService.getGesendet(userId).stream()
                .map(n -> toDto(n, userId)).toList());
    }

    @GetMapping("/archiv")
    public ResponseEntity<List<NachrichtItemDto>> getArchiv() {
        String userId = securityHelper.getCurrentUserId();
        return ResponseEntity.ok(nachrichtService.getArchiv(userId).stream()
                .map(n -> toDto(n, userId)).toList());
    }

    @GetMapping("/ungelesen-anzahl")
    public ResponseEntity<Map<String, Long>> getUngelesenAnzahl() {
        String userId = securityHelper.getCurrentUserId();
        return ResponseEntity.ok(Map.of("anzahl", nachrichtService.getUngeleseneAnzahl(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NachrichtItemDto> getById(@PathVariable String id) {
        String userId = securityHelper.getCurrentUserId();
        NachrichtItem item = nachrichtService.findById(id);
        nachrichtService.alsGelesenMarkieren(id, userId);
        return ResponseEntity.ok(toDto(item, userId));
    }

    @PostMapping
    public ResponseEntity<NachrichtItemDto> erstellen(@Valid @RequestBody ErstellenRequest request) {
        String userId = securityHelper.getCurrentUserId();
        String tenantId = securityHelper.getCurrentTenantId();
        NachrichtItem item = nachrichtService.erstellen(
                userId, tenantId,
                request.typ != null ? request.typ : NachrichtTyp.NACHRICHT,
                request.betreff, request.inhalt,
                request.prioritaet, request.frist, request.erinnerungAm,
                request.empfaengerIds, false, request.referenzTyp, request.referenzId);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(item, userId));
    }

    @PutMapping("/{id}/gelesen")
    public ResponseEntity<Void> alsGelesen(@PathVariable String id) {
        nachrichtService.alsGelesenMarkieren(id, securityHelper.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/ungelesen")
    public ResponseEntity<Void> alsUngelesen(@PathVariable String id) {
        nachrichtService.alsUngelesenMarkieren(id, securityHelper.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/archivieren")
    public ResponseEntity<Void> archivieren(@PathVariable String id) {
        nachrichtService.archivieren(id, securityHelper.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/erledigt")
    public ResponseEntity<Void> alsErledigt(@PathVariable String id) {
        nachrichtService.alsErledigtMarkieren(id, securityHelper.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> loeschen(@PathVariable String id) {
        String userId = securityHelper.getCurrentUserId();
        auditService.log(userId, securityHelper.getCurrentTenantId(),
                "NACHRICHT_GELOESCHT", "Nachricht geloescht: " + id);
        nachrichtService.loeschen(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/alle-gelesen")
    public ResponseEntity<Map<String, Integer>> alleAlsGelesen() {
        int count = nachrichtService.alleAlsGelesenMarkieren(securityHelper.getCurrentUserId());
        return ResponseEntity.ok(Map.of("markiert", count));
    }

    @PostMapping("/{id}/unteraufgaben")
    public ResponseEntity<NachrichtItemDto> unteraufgabeErstellen(
            @PathVariable String id, @Valid @RequestBody UnteraufgabeRequest request) {
        String userId = securityHelper.getCurrentUserId();
        String tenantId = securityHelper.getCurrentTenantId();
        NachrichtItem item = nachrichtService.unteraufgabeErstellen(
                id, userId, tenantId,
                request.betreff, request.inhalt,
                request.prioritaet, request.frist, request.empfaengerIds);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(item, userId));
    }

    @GetMapping("/{id}/unteraufgaben")
    public ResponseEntity<List<NachrichtItemDto>> getUnteraufgaben(@PathVariable String id) {
        String userId = securityHelper.getCurrentUserId();
        return ResponseEntity.ok(nachrichtService.getUnteraufgaben(id).stream()
                .map(n -> toDto(n, userId)).toList());
    }

    @PostMapping("/{id}/anhaenge")
    public ResponseEntity<AnhangDto> anhangHochladen(
            @PathVariable String id,
            @RequestParam("datei") MultipartFile datei) throws IOException {
        NachrichtAnhang anhang = nachrichtService.anhangHinzufuegen(
                id, datei.getOriginalFilename(), datei.getContentType(),
                datei.getSize(), datei.getBytes());
        return ResponseEntity.status(HttpStatus.CREATED).body(toAnhangDto(anhang));
    }

    @GetMapping("/anhaenge/{anhangId}")
    public ResponseEntity<byte[]> anhangHerunterladen(@PathVariable String anhangId) {
        NachrichtAnhang anhang = nachrichtService.getAnhang(anhangId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + anhang.getDateiname() + "\"")
                .contentType(MediaType.parseMediaType(
                        anhang.getDateityp() != null ? anhang.getDateityp() : "application/octet-stream"))
                .contentLength(anhang.getDateigroesse())
                .body(anhang.getDaten());
    }

    private NachrichtItemDto toDto(NachrichtItem item, String currentUserId) {
        NachrichtEmpfaenger empfStatus = nachrichtService.getEmpfaengerStatus(item.getId(), currentUserId);
        return new NachrichtItemDto(
                item.getId(),
                item.getTyp().name(),
                item.getBetreff(),
                item.getInhalt(),
                item.getErsteller().getId(),
                item.getErsteller().getVorname() + " " + item.getErsteller().getNachname(),
                item.getErsteller().getInitialen(),
                item.getPrioritaet().name(),
                item.getStatus().name(),
                item.getFrist(),
                item.getErinnerungAm(),
                item.getErstelltAm(),
                item.isSystemGeneriert(),
                item.getReferenzTyp(),
                item.getReferenzId(),
                item.getEmpfaenger().stream().map(e -> new EmpfaengerDto(
                        e.getEmpfaenger().getId(),
                        e.getEmpfaenger().getVorname() + " " + e.getEmpfaenger().getNachname(),
                        e.getEmpfaenger().getInitialen(),
                        e.isGelesen(), e.isArchiviert(), e.isErledigt()
                )).toList(),
                item.getAnhaenge().stream().map(this::toAnhangDto).toList(),
                empfStatus != null && empfStatus.isGelesen(),
                empfStatus != null && empfStatus.isArchiviert(),
                empfStatus != null && empfStatus.isErledigt(),
                item.getParent() != null ? item.getParent().getId() : null,
                nachrichtService.countUnteraufgaben(item.getId()),
                nachrichtService.countErledigteUnteraufgaben(item.getId())
        );
    }

    private AnhangDto toAnhangDto(NachrichtAnhang a) {
        return new AnhangDto(a.getId(), a.getDateiname(), a.getDateityp(), a.getDateigroesse(), a.getErstelltAm());
    }

    record ErstellenRequest(NachrichtTyp typ,
                            @NotBlank(message = "Betreff ist erforderlich") String betreff,
                            String inhalt,
                            NachrichtPrioritaet prioritaet, LocalDateTime frist,
                            LocalDateTime erinnerungAm,
                            @NotEmpty(message = "Mindestens ein Empfaenger ist erforderlich") List<String> empfaengerIds,
                            String referenzTyp, String referenzId) {}

    record NachrichtItemDto(String id, String typ, String betreff, String inhalt,
                            String erstellerId, String erstellerName, String erstellerInitialen,
                            String prioritaet, String status, LocalDateTime frist,
                            LocalDateTime erinnerungAm, LocalDateTime erstelltAm,
                            boolean systemGeneriert, String referenzTyp, String referenzId,
                            List<EmpfaengerDto> empfaenger, List<AnhangDto> anhaenge,
                            boolean gelesen, boolean archiviert, boolean erledigt,
                            String parentId, long unteraufgabenGesamt, long unteraufgabenErledigt) {}

    record UnteraufgabeRequest(@NotBlank(message = "Betreff ist erforderlich") String betreff,
                               String inhalt, NachrichtPrioritaet prioritaet,
                               LocalDateTime frist, List<String> empfaengerIds) {}

    record EmpfaengerDto(String id, String name, String initialen,
                         boolean gelesen, boolean archiviert, boolean erledigt) {}

    record AnhangDto(String id, String dateiname, String dateityp, Long dateigroesse,
                     LocalDateTime erstelltAm) {}
}
