package com.challenge.domain.repository

import com.challenge.domain.entity.MissionTemplate
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface MissionTemplateRepository : JpaRepository<MissionTemplate, UUID>
